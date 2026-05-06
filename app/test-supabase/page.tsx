'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'

export default function Page() {
  console.log("Test Page rendering...");
  const [todos, setTodos] = useState([])

  useEffect(() => {
    console.log("useEffect triggered...");
    async function getTodos() {
      console.log("Calling supabase.from('todos').select()...");
      const { data: todos, error } = await supabase.from('todos').select()
      console.log("Supabase response received:", { todos, error });

      if (error) {
        console.error("Error fetching from Supabase:", error.message, error.details);
        return;
      }

      if (todos) {
        console.log("Data successfully fetched from Supabase:", todos);
        alert(todos.length)
        setTodos(todos)
      }
    }

    getTodos()
  }, [])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  )
}
