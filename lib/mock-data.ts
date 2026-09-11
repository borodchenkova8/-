// Мок-данные для статического режима (без БД)
// Используются когда USE_DATABASE=false или БД недоступна

import { Service, Habit } from "./models";

export const mockServices: Service[] = [
  {
    id: "mock-service-1",
    name: "API Gateway",
    description: "Шлюз для микросервисной архитектуры",
    status: "active",
    url: "https://api.example.com",
    createdAt: new Date("2024-01-15").toISOString(),
    updatedAt: new Date("2024-01-15").toISOString(),
  },
  {
    id: "mock-service-2",
    name: "Auth Service",
    description: "Сервис аутентификации и авторизации",
    status: "active",
    url: "https://auth.example.com",
    createdAt: new Date("2024-02-01").toISOString(),
    updatedAt: new Date("2024-02-01").toISOString(),
  },
  {
    id: "mock-service-3",
    name: "ML Pipeline",
    description: "Пайплайн для обработки данных с AI",
    status: "deploying",
    url: undefined,
    createdAt: new Date("2024-03-10").toISOString(),
    updatedAt: new Date("2024-03-10").toISOString(),
  },
];

export const mockHabits: Habit[] = [
  {
    id: "default-habit",
    title: "Тренировки",
    type: "discrete",
    goal: 100,
    cells: {
      "2026-06-02": true,
      "2026-06-05": true,
      "2026-06-10": true,
    },
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
  {
    id: "numeric-habit",
    title: "Вода за день",
    description: "Выпито воды в мл",
    type: "numeric",
    goal: 2000,
    cells: {},
    numericValue: 750,
    createdAt: new Date("2024-01-01").toISOString(),
    updatedAt: new Date("2024-01-01").toISOString(),
  },
];
