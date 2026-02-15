interface Props {
  quiz: any;
}

export default function QuizCard({ quiz }: Props) {
  return (
    <div>
      <h2>{quiz.title}</h2>
      <p>{quiz.summary}</p>

      <h3>Questions</h3>

      {quiz.quiz?.map((q: any, index: number) => (
        <div key={index} style={questionCard}>
          <h4>
            {index + 1}. {q.question}
          </h4>

          <ul>
            {q.options.map((opt: string, i: number) => (
              <li key={i}>{opt}</li>
            ))}
          </ul>

          <p><strong>Answer:</strong> {q.answer}</p>
          <p><strong>Difficulty:</strong> {q.difficulty}</p>
          <p><strong>Explanation:</strong> {q.explanation}</p>
        </div>
      ))}

      <h3>Related Topics</h3>
      <ul>
        {quiz.related_topics?.map((topic: string, index: number) => (
          <li key={index}>{topic}</li>
        ))}
      </ul>
    </div>
  );
}

const questionCard = {
  backgroundColor: "#f9fafb",
  padding: "15px",
  marginBottom: "15px",
  borderRadius: "8px",
};
