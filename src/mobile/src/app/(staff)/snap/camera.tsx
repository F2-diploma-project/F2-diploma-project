import { useRouter } from 'expo-router';
import { backend } from '../../../data/mockStore';
import { CameraScreen } from '../../../features/snap/CameraScreen';

export default function SnapCamera() {
  const router = useRouter();
  return (
    <CameraScreen
      onClose={() => router.back()}
      onPhoto={async (image) => {
        try {
          const { job_id } = await backend.recognition.createJob(image);
          router.replace(`/snap/${job_id}`);
        } catch {
          router.replace('/snap/failed?code=NETWORK');
        }
      }}
    />
  );
}
