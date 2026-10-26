type Props = {
    question: {
        question: string;
        imageUrl: string | null;
    };
};

export default function QuestionCard({ question }: Props) {
    let renvoie = null;


    if (question.imageUrl && question.imageUrl.includes("uploads")) {
        const lien = question.imageUrl.replace("3000uploads", "3000/uploads");

        renvoie = (
            <div className="question-card">
                <img src={lien} alt="Image de la question" />
                <h2>{question.question}</h2>
            </div>
        );
    }
    else {
        if (question.imageUrl){
            const lien = question.imageUrl.replace("http://91.134.138.136:3000", "");
            renvoie = (
                <div className="question-card">
                    <h3>{lien}</h3>
                    <h2>{question.question}</h2>
                </div>
            );
        }
    }

    return renvoie;
}