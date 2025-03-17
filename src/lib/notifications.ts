import { messaging } from './firebaseAdmin';
import { supabase } from './supabase';

export async function sendNotificationToAdmins(title: string, body: string) {
  try {
    const { data: admins, error } = await supabase
      .from('profiles')
      .select('fcm_token')
      .eq('role', 'admin');

    if (error) throw error;

    const tokens = admins.map((admin) => admin.fcm_token).filter(Boolean);

    if (tokens.length === 0) return;

    const message = {
      notification: {
        title,
        body,
      },
      tokens,
    };

    await messaging.sendMulticast(message);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}