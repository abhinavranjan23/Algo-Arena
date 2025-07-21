import React from "react";
import { Link } from "react-router-dom";
import useGetAllProblems from "../hooks/useGetAllProblems";
import { BookOpenIcon } from "@heroicons/react/24/outline";

const difficultyColor = {
  Easy: "bg-green-100 text-green-700",
  Medium: "bg-yellow-100 text-yellow-700",
  Hard: "bg-red-100 text-red-700",
};

const Main = () => {
  const { problems } = useGetAllProblems();

  return (
    <div className='px-6 py-10 w-4xl md:w-6xl mt-14'>
      <h1 className='text-4xl font-bold mb-8 text-center text-gray-800'>
        🧠 Practice Problems
      </h1>

      <div className='overflow-x-auto rounded-xl shadow-lg bg-white'>
        <table className='min-w-full text-sm text-left text-gray-700'>
          <thead className='bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b'>
            <tr>
              <th className='px-6 py-4'>No.</th>
              <th className='px-6 py-4'>Title</th>
              <th className='px-6 py-4'>Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {problems && problems.length > 0 ? (
              problems.map((problem, index) => (
                <tr
                  key={problem._id}
                  className='border-b hover:bg-blue-50 group transition duration-200'
                >
                  <td className='px-6 py-4 font-semibold'>{index + 1}</td>
                  <td className='px-6 py-4'>
                    <Link
                      to={`/problem/${problem._id}`}
                      className='flex items-center gap-2 text-blue-600 group-hover:underline'
                    >
                      <BookOpenIcon className='h-5 w-5 text-blue-400 group-hover:scale-105 transition-transform duration-200' />
                      {problem.title}
                    </Link>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        difficultyColor[problem.difficulty]
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='3' className='text-center p-6 text-gray-500'>
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Main;
