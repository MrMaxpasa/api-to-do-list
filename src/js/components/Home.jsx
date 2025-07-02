import React, { useState } from 'react';
import '../../styles/index.css';

const API_BASE        = username => `https://playground.4geeks.com/todo/users/${username}`;
const API_POST        = username => `https://playground.4geeks.com/todo/todos/${username}`;
const API_DELETE      = todoId   => `https://playground.4geeks.com/todo/todos/${todoId}`;
const API_DELETE_USER = username => `https://playground.4geeks.com/todo/users/${username}`;

export default function Home() {
    const [username, setUsername]       = useState('');
    const [userCreated, setUserCreated] = useState(false);
    const [tasks, setTasks]             = useState([]);
    const [newTask, setNewTask]         = useState('');
    const [loading, setLoading]         = useState(false);

    const createUser = () => {
        if (!username.trim()) return;
        setLoading(true);
        fetch(API_BASE(username), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([])
        })
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status} creating user`);
            setUserCreated(true);
            return loadTasks();
        })
        .catch(err => console.error('Create user error:', err))
        .finally(() => setLoading(false));
    };

    const deleteUser = () => {
        if (!window.confirm(`¿Eliminar al usuario "${username}"?`)) return;
        setLoading(true);
        fetch(API_DELETE_USER(username), { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status} deleting user`);
            // reset state tras eliminar
            setUserCreated(false);
            setUsername('');
            setTasks([]);
        })
        .catch(err => console.error('Delete user error:', err))
        .finally(() => setLoading(false));
    };

    const loadTasks = () => {
        setLoading(true);
        return fetch(API_BASE(username), { method: 'GET' })
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status} fetching tasks`);
            return res.json();
        })
        .then(data => {
            const todos = Array.isArray(data) ? data : data.todos || [];
            setTasks(todos);
        })
        .catch(err => console.error('Load tasks error:', err))
        .finally(() => setLoading(false));
    };

    const addTask = () => {
        if (!newTask.trim()) return;
        setLoading(true);
        fetch(API_POST(username), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: newTask, is_done: false })
        })
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status} adding task`);
            return res.json();
        })
        .then(() => {
            setNewTask('');
            loadTasks();
        })
        .catch(err => console.error('Add task error:', err))
        .finally(() => setLoading(false));
    };

    const deleteTask = id => {
        setLoading(true);
        fetch(API_DELETE(id), { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error(`Error ${res.status} deleting task`);
        })
        .then(() => loadTasks())
        .catch(err => console.error('Delete task error:', err))
        .finally(() => setLoading(false));
    };

    const clearAll = () => {
        if (!window.confirm('¿Borrar todas las tareas?')) return;
        setLoading(true);

        Promise.all(
            tasks.map(task =>
                fetch(API_DELETE(task.id), { method: 'DELETE' })
            )
        )
        .then(responses => {
            const hasError = responses.some(res => !res.ok);
            if (hasError) throw new Error('Alguna tarea no se pudo borrar');
        })
        .then(() => {
            setTasks([]);
            return loadTasks();
        })
        .catch(err => console.error('Error borrando todas las tareas:', err))
        .finally(() => setLoading(false));
    };

    if (!userCreated) {
        return (
            <div className="todo-container">
                <h1 className="todo-header">Crear Usuario</h1>
                <div className="todo-input-container">
                    <input
                        className="todo-input"
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="todo-add-button"
                        onClick={createUser}
                        disabled={loading || !username.trim()}
                    >
                        {loading ? 'Creando...' : 'Crear'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="todo-container">
            <div className="todo-header-row">
                <h1 className="todo-header">{username}'s TODO List</h1>
                <button
                    className="todo-delete-user-button"
                    onClick={deleteUser}
                    disabled={loading}
                >
                    {loading ? 'Procesando...' : 'Eliminar Usuario'}
                </button>
            </div>
            <br />
            <div className="todo-input-container">
                <input
                    className="todo-input"
                    type="text"
                    placeholder="Nueva tarea..."
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    disabled={loading}
                />
                <button
                    className="todo-add-button"
                    onClick={addTask}
                    disabled={loading || !newTask.trim()}
                >
                    {loading ? 'Añadiendo...' : 'Agregar'}
                </button>
            </div>
            <button
                className="todo-clear-button"
                onClick={clearAll}
                disabled={tasks.length === 0 || loading}
            >
                {loading ? 'Procesando...' : 'Borrar Todas'}
            </button>

            {loading ? (
                <p>Cargando...</p>
            ) : tasks.length > 0 ? (
                <ul className="todo-list">
                    {tasks.map(task => (
                        <li key={task.id} className="todo-item">
                            <span>{task.label}</span>
                            <button
                                className="todo-delete-button"
                                onClick={() => deleteTask(task.id)}
                            >
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No hay tareas. ¡Agrega una!</p>
            )}
        </div>
    );
}
