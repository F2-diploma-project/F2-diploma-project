import { Redirect } from 'expo-router';

export default function Index() {
  // Екрани адміністратора — наступним кроком; поки обидві ролі бачать лоти.
  return <Redirect href="/lots" />;
}
