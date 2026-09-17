import { createBrowserRouter, createHashRouter, RouterProvider } from "react-router-dom";
import { SiteLayout } from "./components/SiteLayout";
import { DemoStateProvider } from "./lib/DemoStateProvider";
import { Landing } from "./pages/Landing";
import { ForOrganizations } from "./pages/ForOrganizations";
import { Trust } from "./pages/Trust";
import { Deck } from "./pages/Deck";
import { DemoLayout } from "./pages/demo/DemoLayout";
import { Onboarding } from "./pages/demo/Onboarding";
import { Log } from "./pages/demo/Log";
import { Report } from "./pages/demo/Report";
import { Actions } from "./pages/demo/Actions";
import { NotFound } from "./pages/NotFound";

const routes = [
  {
    element: <SiteLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/for-organizations", element: <ForOrganizations /> },
      { path: "/trust", element: <Trust /> },
      {
        element: <DemoLayout />,
        children: [
          { path: "/demo", element: <Onboarding /> },
          { path: "/demo/log", element: <Log /> },
          { path: "/demo/report", element: <Report /> },
          { path: "/demo/actions", element: <Actions /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
  { path: "/deck", element: <Deck /> },
];

/**
 * A statically hosted build (the shareable preview) has no server to rewrite
 * unknown paths back to index.html, so deep links need hash routing there.
 * Normal builds keep clean paths.
 */
const router = import.meta.env.VITE_HASH_ROUTER === "1"
  ? createHashRouter(routes)
  : createBrowserRouter(routes);

export default function App() {
  return (
    <DemoStateProvider>
      <RouterProvider router={router} />
    </DemoStateProvider>
  );
}
