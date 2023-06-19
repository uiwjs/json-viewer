import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

it('renders without crashing', () => {
  function AppWithCallbackAfterRender() {
    useEffect(() => {
      console.log('rendered');
    });

    return <App  />
  }

  const div = document.createElement('div');
  const root = createRoot(div!);
  root.render(<AppWithCallbackAfterRender />);
  root.unmount();
});
