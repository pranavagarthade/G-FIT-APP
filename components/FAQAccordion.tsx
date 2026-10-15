import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography, Animation } from '../constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

function FAQRow({ item }: { item: FAQItem }) {
  const [expanded, setExpanded] = useState(false);
  const animHeight = React.useRef(new Animated.Value(0)).current;

  const toggle = () => {
    setExpanded(!expanded);
    Animated.timing(animHeight, {
      toValue: expanded ? 0 : 1,
      duration: Animation.standard,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={toggle} style={styles.header} activeOpacity={0.7}>
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons
          name={expanded ? 'remove' : 'add'}
          size={20}
          color={Colors.primaryTeal}
        />
      </TouchableOpacity>
      {expanded && (
        <Animated.View style={styles.answerContainer}>
          <Text style={styles.answer}>{item.answer}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  return (
    <View style={styles.container}>
      {items.map((item, index) => (
        <FAQRow key={index} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 1,
  },
  row: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  question: {
    ...Typography.body,
    fontFamily: 'Poppins-Medium',
    flex: 1,
    marginRight: Spacing.sm,
  },
  answerContainer: {
    paddingHorizontal: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  answer: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
});
