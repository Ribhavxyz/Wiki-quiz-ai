import QuizCard from "./QuizCard";

interface Props {
  quiz: any;
  onClose: () => void;
}

export default function QuizModal({ quiz, onClose }: Props) {
  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <button onClick={onClose} style={closeButton}>
          Close
        </button>

        <QuizCard quiz={quiz} />
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  backgroundColor: "white",
  width: "80%",
  maxHeight: "90%",
  overflowY: "auto" as const,
  padding: "20px",
  borderRadius: "10px",
};

const closeButton = {
  float: "right" as const,
  marginBottom: "10px",
};
