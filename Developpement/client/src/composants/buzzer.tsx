type BuzzerProps = {
  onBuzz: () => void;
};

export default function Buzzer({ onBuzz }: BuzzerProps) {
  return (
    <button className="buzzer" onClick={onBuzz}>
      BUZZ !
    </button>
  );
}
