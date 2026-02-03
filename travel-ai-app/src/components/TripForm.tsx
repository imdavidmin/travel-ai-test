import {
  Button,
  Field,
  Input,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { TripDetails } from "../types";

const useStyles = makeStyles({
  form: {
    display: "grid",
    gap: tokens.spacingVerticalM,
  },
  row: {
    display: "grid",
    gap: tokens.spacingHorizontalM,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  actions: {
    display: "flex",
    gap: tokens.spacingHorizontalM,
  },
});

interface TripFormProps {
  value: TripDetails;
  onChange: (field: keyof TripDetails, value: string) => void;
  onCheck: () => void;
  onPacking: () => void;
  labels: {
    origin: string;
    destination: string;
    checkButton: string;
    packingButton: string;
  };
}

export default function TripForm({
  value,
  onChange,
  onCheck,
  onPacking,
  labels,
}: TripFormProps) {
  const styles = useStyles();

  return (
    <div className={styles.form}>
      <div className={styles.row}>
        <Field label={labels.origin}>
          <Input
            value={value.origin}
            onChange={(event) => onChange("origin", event.target.value)}
          />
        </Field>
        <Field label={labels.destination}>
          <Input
            value={value.destination}
            onChange={(event) => onChange("destination", event.target.value)}
          />
        </Field>
      </div>

      <div className={styles.actions}>
        <Button appearance="primary" onClick={onCheck}>
          {labels.checkButton}
        </Button>
        <Button appearance="secondary" onClick={onPacking}>
          {labels.packingButton}
        </Button>
      </div>
    </div>
  );
}
