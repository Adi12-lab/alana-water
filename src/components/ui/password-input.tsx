import { Eye, EyeOff } from "lucide-react";
import { forwardRef, useState, InputHTMLAttributes } from 'react';

import { Input } from "~/components/ui/input";

export type Ref = HTMLInputElement;

const PasswordInput = forwardRef<Ref, InputHTMLAttributes<HTMLInputElement>>((props, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <Input ref={ref} type={showPassword ? "text" : "password"} {...props} />
      <button
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-3 bottom-2"
        type="button"
      >
        {showPassword ? <EyeOff /> : <Eye />}
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;