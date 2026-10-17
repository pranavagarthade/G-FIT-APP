import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Typography, Spacing, Radius } from '../constants/theme';
import ChatBubble from '../components/ChatBubble';
import { ChatSource, streamChat } from '../services/chatApi';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
  imageUri?: string;
  sources?: ChatSource[];
}

const quickReplies = ['Make a meal plan', 'Fix my form', 'Weekly workout'];
const initialMessages: Message[] = [{
  id: 'welcome',
  text: "Hi! I'm FitCoach. Ask a fitness question or share a food, exercise, equipment, or progress photo.",
  isUser: false,
  timestamp: 'Now',
}];

export default function ChatbotScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const contentWidth = Math.min(width - Spacing.md * 2, 760);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<{ uri: string; name: string; type: string }>();
  const [conversationId, setConversationId] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [lastRequest, setLastRequest] = useState<{ text: string; image?: typeof image }>();
  const scrollRef = useRef<ScrollView>(null);

  const selectImage = async (source: 'camera' | 'library') => {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', `Please allow ${source} access to attach a photo.`);
      return;
    }
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const resized = await ImageManipulator.manipulateAsync(
      asset.uri,
      asset.width > 1024 || asset.height > 1024
        ? [{ resize: asset.width >= asset.height ? { width: 1024 } : { height: 1024 } }]
        : [],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    setImage({ uri: resized.uri, name: `fitcoach-${Date.now()}.jpg`, type: 'image/jpeg' });
  };

  const sendMessage = async (retryValues?: { text: string; image?: typeof image }) => {
    const values = retryValues || { text: input.trim(), image };
    if (!values.text && !values.image) return;
    setLastRequest(values);
    setInput('');
    setImage(undefined);
    const userMessage: Message = {
      id: `${Date.now()}-user`,
      text: values.text || 'Photo',
      isUser: true,
      timestamp: 'Now',
      imageUri: values.image?.uri,
    };
    const assistantId = `${Date.now()}-assistant`;
    setMessages((current) => [...current, userMessage, { id: assistantId, text: '', isUser: false, timestamp: 'Now' }]);
    setLoading(true);
    try {
      await streamChat(
        { text: values.text, conversationId, image: values.image },
        (event) => {
          if (event.type === 'token') {
            setMessages((current) => current.map((message) => message.id === assistantId
              ? { ...message, text: `${message.text}${event.text || ''}` } : message));
          } else if (event.type === 'done') {
            setConversationId(event.conversationId || conversationId);
            setMessages((current) => current.map((message) => message.id === assistantId
              ? { ...message, text: event.answer || message.text, sources: event.sources } : message));
          } else if (event.type === 'error') {
            throw new Error(event.message || 'The assistant could not respond.');
          }
        },
      );
    } catch (error) {
      setMessages((current) => current.map((message) => message.id === assistantId
        ? { ...message, text: `Unable to respond: ${error instanceof Error ? error.message : 'try again.'}` } : message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={[styles.headerInner, { maxWidth: contentWidth }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <View style={styles.headerIcon}><Ionicons name="sparkles" size={18} color={Colors.primaryTeal} /></View>
            <Text style={styles.headerTitle}>FitCoach</Text>
          </View>
          <View style={styles.status}><View style={styles.onlineDot} /><Text style={styles.statusText}>Grounded</Text></View>
        </View>
      </View>
      <View style={styles.disclaimer}><Text style={[styles.disclaimerText, isTablet && styles.tabletDisclaimer]}>Not medical advice. Stop if you feel pain and consult a professional.</Text></View>
      <KeyboardAvoidingView style={styles.keyboardArea} behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}>
        <ScrollView
          ref={scrollRef}
          style={[styles.messageList, { minHeight: 0 }]}
          contentContainerStyle={[styles.messageContent, { width: contentWidth, alignSelf: 'center' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {messages.map((message) => (
            <View key={message.id}>
              {message.imageUri && <Image source={{ uri: message.imageUri }} style={styles.messageImage} />}
              <ChatBubble message={message.text || '…'} isUser={message.isUser} timestamp={message.timestamp} />
              {!!message.sources?.length && <Text style={styles.sources}>Sources: {message.sources.map((source) => source.title).join(' · ')}</Text>}
            </View>
          ))}
          {loading && <ActivityIndicator color={Colors.primaryTeal} style={styles.loading} />}
          {lastRequest && !loading && messages[messages.length - 1]?.text.startsWith('Unable to respond') && (
            <TouchableOpacity style={styles.retry} onPress={() => sendMessage(lastRequest)}>
              <Ionicons name="refresh" size={16} color={Colors.primaryTeal} /><Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { width: contentWidth, alignSelf: 'center' }]} style={styles.chipList}>
          {quickReplies.map((reply) => <TouchableOpacity key={reply} style={styles.chip} onPress={() => setInput(reply)}><Text numberOfLines={1} style={styles.chipText}>{reply}</Text></TouchableOpacity>)}
        </ScrollView>
        {image && <View style={styles.preview}><Image source={{ uri: image.uri }} style={styles.previewImage} /><TouchableOpacity onPress={() => setImage(undefined)}><Ionicons name="close-circle" size={24} color={Colors.destructive} /></TouchableOpacity></View>}
        <View style={[styles.inputBar, { maxWidth: contentWidth }]}>
          <TouchableOpacity onPress={() => Alert.alert('Attach photo', 'Choose a source', [{ text: 'Camera', onPress: () => selectImage('camera') }, { text: 'Gallery', onPress: () => selectImage('library') }, { text: 'Cancel', style: 'cancel' }])} style={styles.attachBtn}>
            <Ionicons name="image-outline" size={22} color={Colors.primaryTeal} />
          </TouchableOpacity>
          <TextInput style={styles.input} placeholder="Ask FitCoach..." placeholderTextColor={Colors.textSecondary} value={input} onChangeText={setInput} onSubmitEditing={() => sendMessage()} returnKeyType="send" />
          <TouchableOpacity onPress={() => sendMessage()} style={[styles.sendBtn, !input.trim() && !image && styles.sendBtnDisabled]} disabled={!input.trim() && !image}>
            <Ionicons name="send" size={20} color={input.trim() || image ? Colors.white : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  keyboardArea: { flex: 1, minHeight: 0 },
  header: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerInner: { width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  headerIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primaryTealLight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.h2 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.accentLime },
  statusText: { ...Typography.caption, fontSize: 10 },
  disclaimer: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, backgroundColor: Colors.accentLimeLight },
  disclaimerText: { ...Typography.caption, fontSize: 10, textAlign: 'center', paddingHorizontal: Spacing.md },
  tabletDisclaimer: { fontSize: 11, paddingVertical: 2 },
  messageList: { flex: 1, minHeight: 0 },
  messageContent: { padding: Spacing.md, paddingBottom: Spacing.sm, flexGrow: 1 },
  messageImage: { width: 180, height: 180, borderRadius: Radius.md, alignSelf: 'flex-end', marginBottom: Spacing.xs },
  sources: { ...Typography.caption, fontSize: 10, marginLeft: Spacing.sm, marginBottom: Spacing.sm },
  loading: { alignSelf: 'flex-start', margin: Spacing.sm },
  retry: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', padding: Spacing.sm },
  retryText: { ...Typography.caption, color: Colors.primaryTeal },
  chipList: { flexGrow: 0, minHeight: 52 },
  chips: { paddingHorizontal: Spacing.md, gap: Spacing.sm, paddingBottom: Spacing.sm, alignItems: 'center' },
  chip: { height: 36, flexGrow: 0, flexShrink: 0, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.primaryTeal, borderRadius: Radius.full, paddingHorizontal: Spacing.md, alignItems: 'center', justifyContent: 'center' },
  chipText: { ...Typography.caption, color: Colors.primaryTeal },
  preview: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  previewImage: { width: 56, height: 56, borderRadius: Radius.sm },
  inputBar: { width: '100%', alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.white, gap: Spacing.sm },
  attachBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, backgroundColor: Colors.cardSurface, borderRadius: Radius.xl, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm + 4, fontFamily: 'Poppins-Regular', fontSize: 14, color: Colors.textPrimary, borderWidth: 1, borderColor: Colors.border },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryTeal, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.cardSurface },
});
