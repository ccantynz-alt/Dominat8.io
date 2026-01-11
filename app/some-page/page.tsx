import { publishProject } from "@/app/actions";
import PublishButton from "./PublishButton";

export default function Page() {
  return <PublishButton action={publishProject} projectId="proj_123" />;
}
