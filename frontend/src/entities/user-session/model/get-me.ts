import { userStore } from "./user.store";
import { getMe as getMeApi } from "../api/get-me";

export const bootstrapUser = async () => {
  const result = await getMeApi();

  if (result.data) {
    userStore.setState({ user: result.data });
  }

  return result;
};
