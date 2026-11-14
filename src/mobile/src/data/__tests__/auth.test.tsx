import { Text } from 'react-native';
import { act, render, screen } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../auth';

function Probe() {
  const auth = useAuth();
  return (
    <>
      <Text testID="who">{auth.session ? `${auth.session.role}:${auth.session.login}` : 'гість'}</Text>
      <Text testID="in" onPress={() => auth.signIn({ role: 'admin', login: 'admin.maria' })}>in</Text>
      <Text testID="out" onPress={() => auth.signOut()}>out</Text>
    </>
  );
}

describe('сесія', () => {
  it('спершу гість, після входу — роль, після виходу — знову гість', async () => {
    await render(<AuthProvider><Probe /></AuthProvider>);
    expect(screen.getByTestId('who')).toHaveTextContent('гість');
    await act(async () => screen.getByTestId('in').props.onPress());
    expect(screen.getByTestId('who')).toHaveTextContent('admin:admin.maria');
    await act(async () => screen.getByTestId('out').props.onPress());
    expect(screen.getByTestId('who')).toHaveTextContent('гість');
  });
});
