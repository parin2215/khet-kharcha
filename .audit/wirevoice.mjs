import fs from "fs";
const file = "C:/Users/patel/OneDrive/Desktop/khet kharcha/mobile/src/screens/expenses/AddExpenseScreen.jsx";
let s = fs.readFileSync(file, "utf8");

// 1) Import the voice sheet.
const impAnchor = "import { toLocalDateString } from '../../../../shared/utils/helpers.js';";
if (!s.includes("VoiceExpenseSheet")) {
  s = s.replace(impAnchor, impAnchor + "\nimport VoiceExpenseSheet from '../../components/VoiceExpenseSheet.jsx';");
}

// 2) Add the visibility state.
s = s.replace(
  "  const [farmDialogVisible, setFarmDialogVisible] = useState(false);",
  "  const [farmDialogVisible, setFarmDialogVisible] = useState(false);\n  const [voiceSheetVisible, setVoiceSheetVisible] = useState(false);"
);

// 3) Handler that applies a parsed voice result to the form.
s = s.replace(
  "  useEffect(() => {\n    if (profile?.uid) {\n      fetchFarms(profile.uid);\n    }\n  }, [profile, fetchFarms]);",
  `  // Apply a parsed voice result to the form fields.
  const applyVoiceResult = ({ amount: voiceAmount, category: voiceCategory, expenseType: voiceType }) => {
    if (voiceAmount) setAmount(String(voiceAmount));
    if (voiceCategory) setCategory(voiceCategory);
    if (voiceType) setExpenseType(voiceType);
  };

  useEffect(() => {
    if (profile?.uid) {
      fetchFarms(profile.uid);
    }
  }, [profile, fetchFarms]);`
);

// 4) Voice button above the amount field.
const amountBlock = `        {/* Amount Input */}
        <Text style={styles.label}>{t('expenses.amount') || 'Expense Amount (₹)'}</Text>`;
const voiceBlock = `        {/* Voice entry */}
        <Button
          mode="outlined"
          icon="microphone"
          onPress={() => setVoiceSheetVisible(true)}
          style={styles.voiceButton}
          contentStyle={styles.voiceButtonContent}
        >
          {t('expenses.speakExpense') || 'Speak expense'}
        </Button>

${amountBlock}`;
s = s.replace(amountBlock, voiceBlock);

// 5) Render the sheet next to the other dialogs.
s = s.replace(
  "    <Portal>\n      <Dialog visible={farmDialogVisible}",
  `    <VoiceExpenseSheet
      visible={voiceSheetVisible}
      onDismiss={() => setVoiceSheetVisible(false)}
      onApply={applyVoiceResult}
      initialCategory={category}
    />

    <Portal>
      <Dialog visible={farmDialogVisible}`
);

// 6) Style for the button.
s = s.replace(
  "const styles = StyleSheet.create({",
  `const styles = StyleSheet.create({
  voiceButton: { marginBottom: 10, borderRadius: 10 },
  voiceButtonContent: { height: 46 },`
);

fs.writeFileSync(file, s, "utf8");
console.log("AddExpenseScreen wired for voice entry");
