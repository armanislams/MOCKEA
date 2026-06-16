import { useParams } from "react-router";
import QuestionSetForm from "./QuestionForm/QuestionSetForm";

const EditQuestionForm = () => {
    const { id } = useParams();
    return <QuestionSetForm mode="edit" questionId={id} />;
};

export default EditQuestionForm;
