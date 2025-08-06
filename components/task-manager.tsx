"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus } from "lucide-react"

interface Task {
  id: string
  title: string
  completed: boolean
  priority: "low" | "medium" | "high"
  createdAt: Date
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "JUnitテストケースを作成",
      completed: false,
      priority: "high",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "GitHub Actionsワークフロー設定",
      completed: true,
      priority: "medium",
      createdAt: new Date(),
    },
  ])
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const addTask = () => {
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle,
        completed: false,
        priority: "medium",
        createdAt: new Date(),
      }
      setTasks([...tasks, newTask])
      setNewTaskTitle("")
    }
  }

  const toggleTask = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>タスク管理アプリ（テスト対象）</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="新しいタスクを入力..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            data-testid="task-input"
          />
          <Button onClick={addTask} data-testid="add-task-button">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 p-3 border rounded-lg ${task.completed ? "bg-gray-50" : "bg-white"}`}
              data-testid={`task-${task.id}`}
            >
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => toggleTask(task.id)}
                data-testid={`task-checkbox-${task.id}`}
              />
              <div className="flex-1">
                <div className={`${task.completed ? "line-through text-gray-500" : ""}`}>{task.title}</div>
              </div>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteTask(task.id)}
                data-testid={`delete-task-${task.id}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-8 text-gray-500">タスクがありません。新しいタスクを追加してください。</div>
        )}

        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            完了: {tasks.filter((t) => t.completed).length} / 全体: {tasks.length}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
