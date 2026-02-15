interface Props {
  quizzes: any[];
  onDetails: (id: number) => void;
}

export default function HistoryTable({ quizzes, onDetails }: Props) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>URL</th>
          <th>Created</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {quizzes.map((quiz) => (
          <tr key={quiz.id}>
            <td>{quiz.id}</td>
            <td>{quiz.title}</td>
            <td style={{ maxWidth: "200px", overflow: "hidden" }}>
              {quiz.url}
            </td>
            <td>
              {new Date(quiz.created_at).toLocaleString()}
            </td>
            <td>
              <button
                onClick={() => onDetails(quiz.id)}
                style={buttonStyle}
              >
                Details
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const buttonStyle = {
  padding: "6px 12px",
  borderRadius: "6px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer",
};
