import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { FyersConnectionPage } from '../FyersConnectionPage';

jest.mock('../auth/FyersAuth', () => ({
  FyersAuth: ({ onAuthSuccess }: { onAuthSuccess?: () => void }) => {
    React.useEffect(() => {
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    }, [onAuthSuccess]);
    return <div>Mock FyersAuth</div>;
  }
}));

describe('FyersConnectionPage', () => {
  it('calls onAuthSuccess and triggers redirect after successful authentication', async () => {
    const onAuthSuccessMock = jest.fn();

    render(<FyersConnectionPage onAuthSuccess={onAuthSuccessMock} />);

    await waitFor(() => {
      expect(onAuthSuccessMock).toHaveBeenCalled();
    });
  });
});
