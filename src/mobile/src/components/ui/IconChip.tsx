import { View } from 'react-native';
import { Icon, type IconName } from '../icons/Icon';

/** Плашка під іконкою (36×36, заокруглення 8). На кольорових плашках — `iconPlate`. */
export function IconChip({ icon, color, background, size = 36, radius = 8 }: { icon: IconName; color: string; background: string; size?: number; radius?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} color={color} size={20} />
    </View>
  );
}
