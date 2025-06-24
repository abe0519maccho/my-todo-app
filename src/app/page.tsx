'use client';

import { useEffect, useState } from 'react';

type Todo = {
  id: number;
  text: string;
  done: boolean;
};

type Filter = 'all' | 'active' | 'completed';

export default function Home() {
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  // ローカルストレージから読み込み
  useEffect(() => {
    const saved = localStorage.getItem('todos');
    if (saved) setTodos(JSON.parse(saved));
  }, []);

  // 保存
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const handleAdd = () => {
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleDone = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  const handleDelete = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleEdit = (id: number, newText: string) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, text: newText } : todo
    ));
    setEditingId(null);
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'all') return true;
    if (filter === 'active') return !todo.done;
    return todo.done;
  });

  return (
    <main className="min-h-screen flex flex-col items-center p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">筋トレメモ（prototype）</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-1 rounded"
          placeholder="やることを入力"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600">
          追加
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        {['all', 'active', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as Filter)}
            className={`px-3 py-1 rounded ${
              filter === f ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 border'
            }`}
          >
            {f === 'all' ? 'すべて' : f === 'active' ? '未完了' : '完了'}
          </button>
        ))}
      </div>

      <ul className="w-full max-w-md space-y-2">
        {filteredTodos.length === 0 ? (
          <li className="text-center text-gray-500">TODOがありません</li>
        ) : (
          filteredTodos.map((todo) => (
            <li key={todo.id} className="bg-white rounded shadow p-2 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => toggleDone(todo.id)}
                />
                {editingId === todo.id ? (
                  <input
                    autoFocus
                    className="border px-2 py-1"
                    defaultValue={todo.text}
                    onBlur={(e) => handleEdit(todo.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleEdit(todo.id, (e.target as HTMLInputElement).value);
                      }
                    }}
                  />
                ) : (
                  <span
                    className={`cursor-pointer ${todo.done ? 'line-through text-gray-400' : ''}`}
                    onDoubleClick={() => setEditingId(todo.id)}
                  >
                    {todo.text}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDelete(todo.id)}
                className="text-red-500 hover:text-red-700"
              >
                🗑
              </button>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
