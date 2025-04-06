import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./TasksPage.module.css";

type Task = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
};

const initialTasks: Task[] = [
  {
    id: "1",
    title: "Сделать кофе",
    description: "Использовать арабику",
    completed: false,
  },
  {
    id: "2",
    title: "Написать отчёт",
    description: "Отчёт по кварталу",
    completed: true,
  },
  {
    id: "3",
    title: "Проверить почту",
    description: "Ответить на важные письма",
    completed: false,
  },
];

const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || source.index === destination.index) return;

    const updated = [...tasks];
    const [moved] = updated.splice(source.index, 1);
    updated.splice(destination.index, 0, moved);
    setTasks(updated);
  };

  const toggleTaskCompletion = (id: string) => {
    const updated = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updated);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <div className={styles.pageTasksList}>
      <h2>Список задач</h2>
      <span>Чем выше задача тем больше у неё приоритет</span>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="taskList">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={styles.tasksList}
            >
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(provided, snapshot) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        backgroundColor: snapshot.isDragging
                          ? "#e0f7fa"
                          : "#fafafa",
                        ...provided.draggableProps.style,
                      }}
                      className={styles.taskList__item}
                    >
                      <div style={{ position: "relative", paddingRight: 30 }}>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          style={{
                            position: "absolute",
                            bottom: 13,
                            right: -15,
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            color: "#888",
                            width: "max-content",
                          }}
                        >
                          ×
                        </button>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(task.id)}
                          style={{
                            position: "absolute",
                            bottom: 6,
                            right: 6,
                            zIndex: 1,
                            width: "max-content",
                          }}
                        />
                        <div>
                          <strong
                            style={{
                              textDecoration: task.completed ? "line-through" : "none",
                              display: "block",
                              paddingRight: 20,
                            }}
                          >
                            {task.title}
                          </strong>
                          <p style={{ margin: "4px 0 0 0", color: "#555", display: "block", paddingRight: 20, }}>
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default TasksPage;
