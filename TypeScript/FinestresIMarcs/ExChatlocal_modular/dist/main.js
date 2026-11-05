import { role } from "./config.js";
import { initAdmin } from "./admin.js";
import { initChat } from "./ui.js";
initChat();
if (role === "admin")
    initAdmin();
//# sourceMappingURL=main.js.map