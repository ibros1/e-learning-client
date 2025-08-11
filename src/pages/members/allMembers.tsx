import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { listUsersFn } from "../../store/slices/auth/user/getAllUsers";
import { BASE_API_URL } from "../../constants/base_url";

const MembersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    dispatch(listUsersFn());
  }, [dispatch]);

  const allUsersState = useSelector((state: RootState) => state.listUsersSlice);
  const members = allUsersState.data?.users ?? [];
  const loginState = useSelector((state: RootState) => state.loginSlice);
  const user = loginState.data?.user;
  const navigate = useNavigate();

  // Haddii user aan la login-gareyn, muuji div w-full oo qoraal ku jira
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-6 w-full">
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
          You must be logged in to see members.
        </p>
      </div>
    );
  }

  if (!members.length) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900 p-6">
        <p className="text-center text-gray-500 dark:text-gray-400 text-lg font-medium">
          No members found!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen px-4 py-8 sm:px-6 lg:px-12  mx-auto">
      <h1 className="text-4xl font-extrabold mb-10 tracking-wide text-gray-900 dark:text-white">
        Members
      </h1>

      <div
        className="grid grid-cols-1 gap-8
        sm:grid-cols-1
        md:grid-cols-2
        lg:grid-cols-2
        xl:grid-cols-4
       "
      >
        {[...members]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .map((m) => (
            <div
              key={m.id}
              className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300  overflow-hidden min-w-[250px]"
            >
              {/* Top Section */}
              <div className="relative p-6 pt-10 flex flex-col items-center text-center">
                {/* Menu icon */}
                <button
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full p-1 transition-colors"
                  aria-label="More options"
                >
                  <li className="bb-icon-ellipsis-h bb-icon-l text-3xl"></li>
                </button>

                {/* Avatar */}
                <div
                  className="relative cursor-pointer"
                  onClick={() => navigate(`/members/${m.id}`)}
                >
                  <img
                    src={`${BASE_API_URL}/uploads/${m.profilePhoto}`}
                    alt={m.full_name}
                    loading="lazy"
                    className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover ring-4 ring-white dark:ring-gray-900 shadow-md"
                  />
                  {/* Active status with pulse */}
                  <span
                    className={`absolute  top-0  right-8 w-5 h-5 rounded-full border-2 border-white dark:border-gray-900 ${
                      m.is_active
                        ? "bg-green-500 animate-pulse shadow-lg"
                        : "bg-gray-400"
                    }`}
                    title={m.is_active ? "Active" : "Inactive"}
                  />
                </div>

                {/* Role Badge */}
                <span
                  className={`z-10 -mt-4 text-xs sm:text-sm font-semibold px-4 py-1 rounded-full shadow-md uppercase tracking-wide select-none ${
                    m.role === "ADMIN"
                      ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-red-700"
                      : "bg-blue-600 text-white dark:bg-gray-700 dark:text-white"
                  }`}
                >
                  {m.role}
                </span>

                {/* Name */}
                <h2
                  className="mt-4 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white truncate max-w-full cursor-pointer"
                  onClick={() => navigate(`/members/${m.id}`)}
                >
                  {m.full_name}
                </h2>

                {/* Username */}
                <p className="mt-1 text-base text-gray-600 dark:text-gray-400 truncate max-w-full">
                  @{m.username}
                </p>

                {/* Joined Date */}
                <p className="mt-3 text-xs text-gray-400 dark:text-gray-500 font-mono">
                  Joined{" "}
                  {new Date(m.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </p>
              </div>

              {/* Footer Buttons */}
              {user?.id !== m.id && (
                <div
                  className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4
                flex flex-col gap-3 text-sm"
                >
                  <button className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-full px-6 py-2 font-semibold shadow-md transition duration-300">
                    Message
                  </button>
                </div>
              )}

              {/* View Profile */}
              <div className="border-t border-gray-200 dark:border-gray-700 text-center px-6 py-3 bg-white dark:bg-gray-800">
                <Link
                  to={`/members/${m.id}`}
                  className="text-blue-700 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-600 text-base font-semibold"
                >
                  View Profile &rarr;
                </Link>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default MembersPage;
