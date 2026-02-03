import {
  Card,
  CardHeader,
  Text,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import type { PackingAdvice } from "../types";

const useStyles = makeStyles({
  content: {
    display: "grid",
    gap: tokens.spacingVerticalXS,
  },
  list: {
    paddingLeft: tokens.spacingHorizontalM,
    margin: 0,
  },
});

interface PackingAdviceProps {
  advice?: PackingAdvice;
  label: string;
  notAvailable: string;
}

export default function PackingAdvice({
  advice,
  label,
  notAvailable,
}: PackingAdviceProps) {
  const styles = useStyles();

  return (
    <Card>
      <CardHeader header={<Text weight="semibold">{label}</Text>} />
      <div className={styles.content}>
        <Text>{advice?.summary ?? notAvailable}</Text>
        {advice?.items && advice.items.length > 0 ? (
          <ul className={styles.list}>
            {advice.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <Text>{notAvailable}</Text>
        )}
        {advice?.notes?.map((note) => (
          <Text key={note}>{note}</Text>
        )) ?? <Text>{notAvailable}</Text>}
      </div>
    </Card>
  );
}
