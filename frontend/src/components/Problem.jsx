// Install required dependencies:
// npm install react-simple-code-editor prismjs react-loader-spinner

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import useUserAuth from "../hooks/useUserAuth";
import { fetchProblemDetails } from "../utils/fetchProblemDetails";
import { BASE_URL } from "../contants/constant";
import { toast } from "react-toastify";
import Editor from "react-simple-code-editor";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/hljs/javascript";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python";
import java from "react-syntax-highlighter/dist/esm/languages/hljs/java";
import c from "react-syntax-highlighter/dist/esm/languages/hljs/cpp";
import { docco, vs2015 } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Oval } from "react-loader-spinner";
import { socket } from "../socket";

SyntaxHighlighter.registerLanguage("javascript", javascript);
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("java", java);
SyntaxHighlighter.registerLanguage("c", c);

const Problem = () => {
  const { loading, user } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { problemId } = useParams();

  const [problem, setProblem] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loadingProblem, setLoadingProblem] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  const difficultyColor = {
    Easy: "text-green-500",
    Medium: "text-yellow-500",
    Hard: "text-red-500",
  };
  useEffect(() => {
    setStartTime(Date.now());

    return () => {
      setStartTime(null);
    };
  }, [problemId]); // jab problemId change ho tab start timer

  useEffect(() => {
    console.log("user", user);
    if (!user && !loading) {
      console.log("i am called now ");
      toast.warn("You need to be logged in to access this page.");
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [, user, loading, navigate, location.pathname]);

  useEffect(() => {
    const loadProblem = async () => {
      if (!problemId) return;
      setLoadingProblem(true);
      setError(null);
      try {
        const data = await fetchProblemDetails(problemId);
        setProblem(data);
        setUserCode(data.defaultFunction || "");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingProblem(false);
      }
    };

    loadProblem();
  }, [problemId]);

  const handleSubmit = async () => {
    if (!userCode || !language) {
      toast.error("Please write code and select a language.");
      return;
    }
    const endTime = Date.now();
    const timeTaken = endTime - startTime;
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch(`${BASE_URL}submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          problemId,
          language,
          code: userCode,
          timeTaken: Math.floor(timeTaken / 1000),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Submission failed");
      if (data.passed) {
        console.log("Submission passed socket called");
        socket.emit("update-score", {
          userId: user._id,
          username: user.username,
          userimageurl: user.userimageurl,
          usercountry: user.usercountry,
          score: data.score,
          gender: user.gender,
        });
      }

      setResult(data);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const highlightCode = (code) => (
    <SyntaxHighlighter
      language={language}
      style={darkMode ? vs2015 : docco}
      customStyle={{
        margin: 0,
        padding: 0, // remove padding here
        backgroundColor: "transparent",
        fontFamily: "monospace",
        fontSize: 14,
        lineHeight: 1.5,
        whiteSpace: "pre-wrap", // or "pre" if you want no wrapping
        overflowWrap: "break-word",
      }}
      codeTagProps={{
        style: {
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: 1.5,
          padding: 0, // also no padding inside code tag
          margin: 0,
        },
      }}
    >
      {code}
    </SyntaxHighlighter>
  );

  if (loading || loadingProblem) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Oval height={50} width={50} color='#4f46e5' />
      </div>
    );
  }

  if (error) return <div className='text-red-600 p-6'>Error: {error}</div>;
  if (!problem) return null;

  return (
    <div
      className={`min-h-screen p-6 mt-14 w-[100vw] ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-3xl font-bold'>{problem.title}</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className='px-4 py-1 rounded bg-indigo-600 text-white'
        >
          Toggle {darkMode ? "Light" : "Dark"} Mode
        </button>
      </div>

      <p
        className={`mb-2 font-semibold ${difficultyColor[problem.difficulty]}`}
      >
        Difficulty: {problem.difficulty}
      </p>
      <p className='mb-6'>{problem.description}</p>
      <div className='mb-4'>
        <h2 className='text-xl font-semibold mb-2'>Example Test Cases</h2>
        <div className='space-y-3'>
          {problem.testCases &&
            problem.testCases.map((tc) => (
              <div
                key={tc._id}
                className={`p-3 border rounded  ${
                  darkMode
                    ? "bg-gray-800 text-gray-200"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p>
                  <strong>Input:</strong> <code>{tc.input}</code>
                </p>
                <p>
                  <strong>Expected Output:</strong>{" "}
                  <code>{tc.expectedOutput}</code>
                </p>
              </div>
            ))}
        </div>
      </div>

      <div className='mb-4'>
        <label className='font-medium block mb-1 '>Select Language:</label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className={`border p-2 rounded ${
            darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          <option value='javascript'>JavaScript</option>
          <option value='python'>Python</option>
          <option value='java'>Java</option>
          <option value='c'>C</option>
        </select>
      </div>

      <div
        className='border rounded overflow-auto mb-3'
        style={{ height: "300px", lineHeight: "1.5" }}
      >
        <Editor
          value={userCode}
          onValueChange={setUserCode}
          highlight={highlightCode}
          padding={10}
          className='font-mono text-sm min-h-full outline-none'
          style={{
            backgroundColor: darkMode ? "#1e1e1e" : "#f7f7f7",
            color: darkMode ? "#f8f8f2" : "#000",
            fontFamily: "monospace",
            fontSize: 14, // same font size
            height: "100%",
            lineHeight: 1.5, // same line height
          }}
        />
      </div>

      <button
        disabled={submitting}
        onClick={handleSubmit}
        className='w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded'
      >
        {submitting ? "Submitting..." : "Submit"}
      </button>

      {result && (
        <div className='mt-6 p-4 bg-gray-800 text-white rounded'>
          <h3 className='text-xl font-bold'>{result.message}</h3>
          <p className={result.passed ? "text-green-400" : "text-red-400"}>
            {result.passed
              ? "✅ All test cases passed"
              : "❌ Some test cases failed"}
          </p>

          <div className='mt-4 space-y-3'>
            {result.results.map((r, idx) => (
              <div key={idx} className='p-3 bg-gray-700 rounded'>
                <p>
                  <strong>Input:</strong> {r.input}
                </p>
                <p>
                  <strong>Expected:</strong> {r.expectedOutput}
                </p>
                <p>
                  <strong>Your Output:</strong> {r.output}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={r.passed ? "text-green-400" : "text-red-400"}
                  >
                    {r.passed ? "Passed" : "Failed"}
                  </span>
                </p>
                {r.errors && <p className='text-red-400'>Error: {r.errors}</p>}
              </div>
            ))}
          </div>

          {result.leaderboard?.length > 0 && (
            <div className='mt-4'>
              <h4 className='font-semibold'>Leaderboard Update</h4>
              <p>
                <strong>Score:</strong> {result.leaderboard[0].score}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {new Date(result.leaderboard[0].updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Problem;
