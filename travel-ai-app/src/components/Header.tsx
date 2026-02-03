import { Text, makeStyles, tokens } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    paddingBottom: tokens.spacingVerticalXL,
  },
  title: {
    display: "block",
  },
  subtitle: {
    color: tokens.colorNeutralForeground2,
  },
});

interface HeaderProps {
  title: string;
  subtitle: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Text size={900} weight="semibold" className={styles.title}>
        {title}
      </Text>
      <Text size={400} className={styles.subtitle}>
        {subtitle}
      </Text>
    </div>
  );
}
