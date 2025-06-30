// src/app/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'

type Todo = {
  id: number
  title: string
  created_at: string
  completed: boolean
}

export default function Home() {
  const [supabase] = useState(() => createBrowserSupabaseClient())
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<'all'|'active'|'done'>('all')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    const { data, error } = await supabase
      .from<Todo>('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setTodos(data)
  }

  async function addTodo() {
    if (!title.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from<Todo>('tasks')
      .insert({ title, completed: false })
      .select()
    setLoading(false)
    if (error || !data) {
      alert('追加に失敗しました: ' + error?.message)
      return
    }
    setTitle('')
    setTodos([data[0], ...todos])
  }

  async function toggleComplete(todo: Todo) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: !todo.completed })
      .eq('id', todo.id)
      .select()
    if (!error && data) {
      setTodos(todos.map(t => t.id === todo.id ? data[0] : t))
    }
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (!error) {
      setTodos(todos.filter(t => t.id !== id))
    }
  }

  // フィルタリング
  const filtered = todos.filter(t => {
    return filter === 'all'
      ? true
      : filter === 'active'
      ? !t.completed
      : t.completed
  })

  return (
    <main className="min-h-screen bg-indigo-50 flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">My TODO App</h1>

      {/* 入力＆Add */}
      <div className="w-full max-w-lg bg-white p-4 rounded-xl shadow mb-6 flex space-x-3">
        <input
          className="flex-1 border rounded px-3 py-2 focus:ring-indigo-300 focus:outline-none"
          placeholder="新しいタスクを入力"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key==='Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          disabled={loading}
          className="bg-indigo-600 text-white px-5 rounded hover:bg-indigo-700 transition disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* フィルタータブ */}
      <div className="flex space-x-4 mb-4">
        {(['all','active','done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 rounded ${
              filter===f ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'
            }`}
          >
            {f==='all' ? 'All' : f==='active' ? 'Active' : 'Done'}
          </button>
        ))}
      </div>

      {/* タスクリスト */}
      <ul className="w-full max-w-lg space-y-3">
        {filtered.length ? filtered.map(todo => (
          <li
            key={todo.id}
            className="bg-white flex items-center justify-between p-3 rounded-lg shadow hover:shadow-lg transition"
          >
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo)}
                className="h-5 w-5 text-indigo-600"
              />
              <span className={`${todo.completed ? 'line-through text-gray-400' : ''}`}>
                {todo.title}
              </span>
            </label>
            <div className="flex items-center space-x-3">
              <time className="text-sm text-gray-500">
                {new Date(todo.created_at).toLocaleTimeString()}
              </time>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-red-500 hover:text-red-700 transition"
              >
                🗑
              </button>
            </div>
          </li>
        )) : (
          <li className="text-center text-gray-400 py-6">タスクがありません</li>
        )}
      </ul>
    </main>
  )
}
