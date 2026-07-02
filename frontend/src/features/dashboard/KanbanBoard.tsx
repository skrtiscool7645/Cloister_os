import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { cn } from '@/lib/utils'

export interface MaintenanceRequest {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  status: string
  property_name?: string
  unit_number?: string
  created_by_name?: string
  assigned_to_name?: string
  created_at: string
  updated_at: string
  photos?: Array<{ id: string; url: string; photo_type: string }>
}

const ALL_STATUSES = ['PENDING', 'APPROVED', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED']
const WORKER_STATUSES = ['ASSIGNED', 'IN_PROGRESS', 'WAITING_PARTS', 'COMPLETED', 'CLOSED']

function getPriorityColor(p: string) {
  switch (p) {
    case 'EMERGENCY': return 'bg-red-100 text-red-700'
    case 'HIGH': return 'bg-orange-100 text-orange-700'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-700'
    default: return 'bg-blue-100 text-blue-700'
  }
}

function getStatusColor(s: string) {
  switch (s) {
    case 'PENDING': return 'border-l-gray-400'
    case 'APPROVED': return 'border-l-blue-400'
    case 'ASSIGNED': return 'border-l-indigo-400'
    case 'IN_PROGRESS': return 'border-l-yellow-400'
    case 'WAITING_PARTS': return 'border-l-orange-400'
    case 'COMPLETED': return 'border-l-green-400'
    case 'CLOSED': return 'border-l-gray-600'
    default: return 'border-l-gray-400'
  }
}

function EmptyColumn() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-xs">No tasks</p>
    </div>
  )
}

interface KanbanBoardProps {
  tasks: MaintenanceRequest[]
  onMoveTask: (taskId: string, newStatus: string) => void
  onCardClick: (task: MaintenanceRequest) => void
  userRole?: string
}

export default function KanbanBoard({ tasks, onMoveTask, onCardClick, userRole }: KanbanBoardProps) {
  const STATUSES = userRole === 'WORKER' ? WORKER_STATUSES : ALL_STATUSES
  const columns = STATUSES.reduce<Record<string, MaintenanceRequest[]>>((acc, status) => {
    acc[status] = tasks.filter((t) => t.status === status)
    return acc
  }, {})

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const { draggableId, destination } = result
    onMoveTask(draggableId, destination.droppableId)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto p-4 bg-gray-100 min-h-screen">
        {STATUSES.map((status) => (
          <div key={status} className="flex-shrink-0 w-72 bg-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-gray-700 mb-4 text-sm uppercase tracking-wide">
              {status.replace(/_/g, ' ')}
              <span className="ml-2 text-xs font-normal text-gray-500">
                ({columns[status]?.length || 0})
              </span>
            </h3>
            <Droppable droppableId={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[200px]"
                >
                  {(columns[status] || []).length === 0 && !snapshot.isDraggingOver && <EmptyColumn />}
                  {(columns[status] || []).map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          onClick={() => onCardClick(task)}
                          className={cn(
                            'bg-white p-4 rounded shadow-sm hover:shadow-md cursor-pointer transition-shadow border-l-4',
                            getStatusColor(task.status),
                          )}
                        >
                          <div className="flex justify-between items-start">
                            <span className={cn('text-xs px-2 py-1 rounded font-medium', getPriorityColor(task.priority))}>
                              {task.priority}
                            </span>
                          </div>
                          <h4 className="mt-2 font-semibold text-sm">{task.title}</h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.property_name} - Unit {task.unit_number}
                          </p>
                          {task.created_by_name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              by {task.created_by_name}
                            </p>
                          )}
                          {task.assigned_to_name && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Assigned to: {task.assigned_to_name}
                            </p>
                          )}
                          <div className="mt-3 flex justify-between items-center">
                            <span className="text-[10px] text-gray-400" title={`Created: ${new Date(task.created_at).toLocaleString()}`}>
                              {new Date(task.created_at).toLocaleDateString()}
                            </span>
                            {task.updated_at !== task.created_at && (
                              <span className="text-[10px] text-gray-300" title={`Updated: ${new Date(task.updated_at).toLocaleString()}`}>
                                updated
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
