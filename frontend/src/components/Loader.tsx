import { ClipLoader } from 'react-spinners';

export const Loader = () => {
  return (
    <div className="flex justify-center items-center h-full w-full py-12">
      <ClipLoader color="var(--color-accent)" size={50} />
    </div>
  );
};
