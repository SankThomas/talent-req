import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { GripVertical, Briefcase, Star, KanbanSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { PageLoader, EmptyState } from "@/components/ui/Loading";
import type { ApplicationStage } from "@/types";
import { STAGE_ORDER, STAGE_LABELS } from "@/types";

interface ColumnApp {
  _id: Id<"applications">;
  _creationTime: number;
  candidateId: Id<"candidates">;
  jobId: Id<"jobs">;
  stage: ApplicationStage;
  rating?: number;
  candidate?: { fullName: string; profileImageUrl?: string; skills?: string[] };
  job?: { title: string };
}

export function PipelinePage() {
  const { toast } = useToast();
  const applications = useQuery(api.applications.getAll, {});
  const updateStage = useMutation(api.applications.updateStage);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeApp, setActiveApp] = useState<ColumnApp | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const loading = applications === undefined;
  if (loading) return <PageLoader />;

  const columns: Record<ApplicationStage, ColumnApp[]> = {
    applied: [],
    screening: [],
    interview: [],
    offer: [],
    hired: [],
    rejected: [],
  };
  applications.forEach((app: any) => {
    const colApp: ColumnApp = {
      _id: app._id,
      _creationTime: app._creationTime,
      candidateId: app.candidateId,
      jobId: app.jobId,
      stage: app.stage,
      rating: app.rating,
      candidate: app.candidate
        ? {
            fullName: app.candidate.fullName,
            profileImageUrl: app.candidate.profileImageUrl,
            skills: app.candidate.skills,
          }
        : undefined,
      job: app.job ? { title: app.job.title } : undefined,
    };
    if (columns[app.stage]) columns[app.stage].push(colApp);
  });

  const totalCount = Object.values(columns).reduce(
    (sum, arr) => sum + arr.length,
    0,
  );

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
    for (const stage of STAGE_ORDER) {
      const found = columns[stage].find((a) => a._id === e.active.id);
      if (found) {
        setActiveApp(found);
        break;
      }
    }
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveId(null);
    setActiveApp(null);
    const { active, over } = e;
    if (!over) return;

    const overId = over.id as string;
    let targetStage: ApplicationStage | null = null;
    if (STAGE_ORDER.includes(overId as ApplicationStage)) {
      targetStage = overId as ApplicationStage;
    } else {
      for (const stage of STAGE_ORDER) {
        if (columns[stage].some((a) => a._id === overId)) {
          targetStage = stage;
          break;
        }
      }
    }
    if (!targetStage) return;

    let currentStage: ApplicationStage | null = null;
    for (const stage of STAGE_ORDER) {
      if (columns[stage].some((a) => a._id === active.id)) {
        currentStage = stage;
        break;
      }
    }
    if (!currentStage || currentStage === targetStage) return;

    try {
      await updateStage({
        id: active.id as Id<"applications">,
        stage: targetStage,
      });
      toast({
        type: "success",
        title: `Moved to ${STAGE_LABELS[targetStage]}`,
      });
    } catch {
      toast({ type: "error", title: "Failed to move candidate" });
    }
  };

  if (totalCount === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">Pipeline</h1>
        <EmptyState
          icon={<KanbanSquare className="h-8 w-8 text-muted-foreground" />}
          title="No applications yet"
          description="Add candidates to jobs from the Candidates page to populate your pipeline."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1800px] mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pipeline</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Drag and drop candidates between stages
        </p>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn key={stage} stage={stage} apps={columns[stage]} />
          ))}
        </div>
        <DragOverlay>
          {activeApp ? <KanbanCard app={activeApp} dragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumn({
  stage,
  apps,
}: {
  stage: ApplicationStage;
  apps: ColumnApp[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const ids = apps.map((a) => a._id);
  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "border-primary/50 bg-primary/5" : ""}`}
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${stageDotClass(stage)}`}
          />
          <span className="text-sm font-semibold text-foreground">
            {STAGE_LABELS[stage]}
          </span>
        </div>
        <span className="badge-muted">{apps.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-25">
          {apps.map((app) => (
            <SortableCard key={app._id} app={app} />
          ))}
          {apps.length === 0 && (
            <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableCard({ app }: { app: ColumnApp }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: app._id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="kanban-card">
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <Link to={`/candidates/${app.candidateId}`} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              name={app.candidate?.fullName ?? "Unknown"}
              src={app.candidate?.profileImageUrl}
              size="sm"
            />
            <p className="text-sm font-medium text-foreground hover:text-primary truncate">
              {app.candidate?.fullName}
            </p>
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1.5">
            <Briefcase className="h-3 w-3" /> {app.job?.title ?? "Unknown role"}
          </p>
          {(app.candidate?.skills ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1">
              {(app.candidate?.skills ?? []).slice(0, 2).map((s) => (
                <span key={s} className="badge-muted text-[10px]">
                  {s}
                </span>
              ))}
            </div>
          )}
          {(app.rating ?? 0) > 0 && (
            <div className="flex items-center gap-0.5 mt-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < (app.rating ?? 0) ? "fill-warning text-warning" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}

function KanbanCard({ app, dragging }: { app: ColumnApp; dragging?: boolean }) {
  return (
    <div className={`kanban-card ${dragging ? "shadow-2xl rotate-2" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <Avatar
          name={app.candidate?.fullName ?? "Unknown"}
          src={app.candidate?.profileImageUrl}
          size="sm"
        />
        <p className="text-sm font-medium text-foreground truncate">
          {app.candidate?.fullName}
        </p>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Briefcase className="h-3 w-3" /> {app.job?.title ?? "Unknown role"}
      </p>
    </div>
  );
}

function stageDotClass(stage: ApplicationStage) {
  const map: Record<ApplicationStage, string> = {
    applied: "bg-blue-500",
    screening: "bg-cyan-500",
    interview: "bg-amber-500",
    offer: "bg-green-500",
    hired: "bg-emerald-500",
    rejected: "bg-red-500",
  };
  return map[stage];
}
