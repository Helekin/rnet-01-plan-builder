import { useRef, useState } from "react";

import { useAccount } from "../../lib/hooks/useAccount";
import { useSearchParams } from "react-router";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");

  const { verifyEmail } = useAccount();
  const userId = searchParams.get("userId");
  const code = searchParams.get("code");
  const hasRun = useRef(false);

  return <div>VerifyEmail</div>;
}
