import React, { useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import styles from "./TasksPage.module.css";
import Header from "../../components/Header/Header";

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

  const [isModalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

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

  const handleAddTask = () => {
    if (!newTitle.trim()) return;
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTitle,
      description: newDescription,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setModalOpen(false);
  };

  const handleEditClick = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id
          ? { ...task, title: editTitle, description: editDescription }
          : task
      )
    );
    setEditingTask(null);
  };

  const handleEditClose = () => {
    setEditingTask(null);
  };

  return (
    <div>
      <Header />
      <div className={styles.pageTasksList}>
        <h2>Список задач</h2>
        <span>Чем выше задача, тем выше приоритет</span>

        <button onClick={() => setModalOpen(true)} className={styles.btn__add}>
          Добавить задачу
        </button>

        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Новая задача</h3>
              <input
                type="text"
                placeholder="Название"
                value={newTitle}
                className={styles.input}
                onChange={(e) => setNewTitle(e.target.value)}
              />
              <textarea
                placeholder="Описание"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className={styles.textarea}
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={() => setModalOpen(false)}
                  className={styles.btn__add}
                  style={{ width: 150, backgroundColor: "red" }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleAddTask}
                  className={styles.btn__add}
                  style={{ width: 150 }}
                >
                  Добавить
                </button>
              </div>
            </div>
          </div>
        )}

        {editingTask && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3>Редактировать задачу</h3>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className={styles.input}
                placeholder="Название"
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className={styles.textarea}
                placeholder="Описание"
              />
              <div className={styles.modalButtons}>
                <button
                  onClick={handleEditClose}
                  className={styles.btn__add}
                  style={{ width: 150, backgroundColor: "red" }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleUpdateTask}
                  className={styles.btn__add}
                  style={{ width: 150 }}
                >
                  Сохранить
                </button>
              </div>

              <button
                onClick={() => (window.location.href = "/pomodoro")}
                className={styles.btn__add}
                style={{ width: "310px", backgroundColor: "#007acc" }}
              >
                Таймер помидоро
              </button>
            </div>
          </div>
        )}

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
                        onClick={() => handleEditClick(task)}
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
                            onClick={(e) => {
                              e.stopPropagation(); 
                              handleDeleteTask(task.id);
                            }}
                            style={{
                              position: "absolute",
                              top: -10,
                              right: 0,
                              background: "transparent",
                              border: "none",
                              cursor: "pointer",
                              color: "#888",
                              width: "max-content",
                              fontSize: 30,
                            }}
                          >
                            ×
                          </button>
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onClick={(e) => e.stopPropagation()} // ← предотвращает всплытие click
  onChange={() => toggleTaskCompletion(task.id)} 
                            style={{
                              position: "absolute",
                              top: 2,
                              right: 20,
                              zIndex: 1,
                              width: "max-content",
                            }}
                          />
                          <div>
                            <strong
                              style={{
                                textDecoration: task.completed
                                  ? "line-through"
                                  : "none",
                                display: "block",
                                paddingRight: 20,
                              }}
                            >
                              {task.title}
                            </strong>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                color: "#555",
                                display: "block",
                                paddingRight: 20,
                              }}
                            >
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
    </div>
  );
};

export default TasksPage;
