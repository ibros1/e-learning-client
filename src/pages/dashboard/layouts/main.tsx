"use client";

import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import {
  Users,
  BookOpenCheck,
  Video,
  GraduationCap,
  CalendarDays,
  LayoutDashboard,
  TrendingUp,
  LineChart,
  LogIn,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Calendar } from "../../../components/ui/calendar";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { listEnrollementsFn } from "../../../store/slices/enrollments/listEnrollements";
import { listUsersFn } from "../../../store/slices/auth/user/getAllUsers";
import { listCoursesFn } from "../../../store/slices/courses/listCourse";
import { listLessonsFn } from "../../../store/slices/lessons/listLessons";
import { listChaptersFn } from "../../../store/slices/chapters/listChapters";
import { BASE_API_URL } from "../../../constants/base_url";
import type { DateRange } from "react-day-picker";

// Utility: Format timestamp to "HH:MM AM/PM"

const userGrowthData = [
  { name: "Mar", users: 700 },
  { name: "Apr", users: 1500 },
  { name: "May", users: 1000 },
  { name: "Jun", users: 1700 },
  { name: "Jul", users: 2100 },
  { name: "Aug", users: 2500 },
];

const salesData = [
  { name: "Mar", sales: 300 },
  { name: "Apr", sales: 500 },
  { name: "May", sales: 750 },
  { name: "Jun", sales: 1100 },
  { name: "Jul", sales: 1350 },
  { name: "Aug", sales: 1800 },
];

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(listEnrollementsFn());
    dispatch(listUsersFn());
    dispatch(listCoursesFn());
    dispatch(listLessonsFn());
    dispatch(listChaptersFn());
  }, [dispatch]);

  const users = useSelector(
    (state: RootState) => state.listUsersSlice.data?.users || []
  );

  const recentLogins = users;
  const courses = useSelector(
    (state: RootState) => state.listCoursesSlice.data?.courses || []
  );
  const enrollements = useSelector(
    (state: RootState) => state.listEnrollementsSlice.data?.enrollemnets || []
  );
  const lessons = useSelector(
    (state: RootState) => state.listLessonSlice.data?.lessons || []
  );
  // const chapters = useSelector(
  //   (state: RootState) => state.listChaptersSlice.data?.chapters || []
  // );

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  return (
    <div className="bg-background dark:bg-[#0b0f1a]">
      <header className="xl:sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-muted bg-card shadow-sm">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboard className="text-blue-500" /> Admin Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition">
            + Add Course
          </button>
        </div>
      </header>

      <main className="p-6 space-y-10  mx-auto">
        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Users", value: users.length, icon: Users },
            { title: "Courses", value: courses.length, icon: BookOpenCheck },
            { title: "Lessons", value: lessons.length, icon: Video },
            {
              title: "Graduates",
              value: enrollements.length,
              icon: GraduationCap,
            },
          ].map(({ title, value, icon: Icon }) => (
            <Card
              key={title}
              className="rounded-2xl border dark:border-muted bg-card shadow hover:shadow-lg transition"
              role="region"
              aria-label={`${title} statistics`}
            >
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    {title}
                  </p>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 p-3 rounded-full">
                  <Icon size={24} aria-hidden="true" />
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          <Card className="rounded-2xl border dark:border-muted bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <TrendingUp className="text-green-500" aria-hidden="true" />{" "}
                User Growth
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={userGrowthData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="userGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", color: "white" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    fill="url(#userGradient)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          {/* calendar */}
          <Card className="rounded-2xl border dark:border-muted bg-card">
            <CardHeader className="flex items-center gap-2">
              <CalendarDays className="text-cyan-500" aria-hidden="true" />
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent className="">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
              />
            </CardContent>
          </Card>
        </section>

        {/* Recent Users & Top Selling Courses */}
        <section className="grid grid-cols-1 lg:grid-cols-[3fr_1fr] gap-6">
          <Card className="rounded-2xl border dark:border-muted bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <LineChart className="text-blue-500" aria-hidden="true" /> Top
                Selling Courses
              </CardTitle>
              <CardDescription>
                Top course sales in last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{ background: "#1e293b", color: "white" }}
                  />
                  <Bar
                    dataKey="sales"
                    fill="#3b82f6"
                    barSize={30}
                    radius={[10, 10, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border dark:border-muted bg-card">
            <CardHeader className="flex items-center gap-3">
              <Users className="text-blue-500" aria-hidden="true" />
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-center">
                  No recent users found.
                </p>
              ) : (
                users.slice(0, 5).map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 hover:bg-muted/30 p-2 rounded-md transition cursor-pointer"
                    title={`${user.full_name} - ${user.role}`}
                  >
                    <img
                      src={`${BASE_API_URL}/uploads/${user.profilePhoto}`}
                      alt={`${user.full_name} profile`}
                      className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      loading="lazy"
                    />
                    <div>
                      <p className="font-medium text-foreground truncate max-w-xs">
                        {user.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {user.role}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        {/* Lessons, Chapters, Last Logs Section */}

        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-zinc-900 rounded-2xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            <LogIn className="w-5 h-5" /> Last Logins
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full table-auto text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Login Time</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((log, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <td className="px-4 py-2">{log.full_name}</td>
                    <td className="px-4 py-2">{log.email}</td>
                    <td className="px-4 py-2">{log.role}</td>
                    <td className="px-4 py-2">
                      {new Date(log.updated_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="text-sm text-muted-foreground text-center pt-6">
          © {new Date().getFullYear()} Built with 💙 by Ibraahim
        </footer>
      </main>
    </div>
  );
}
