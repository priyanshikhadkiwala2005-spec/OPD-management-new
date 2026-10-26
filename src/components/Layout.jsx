import Sidebar from './Sidebar';
import Header  from './Header';

export default function Layout({ children, role, name, title, subtitle }) {
  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="main">
        <Header title={title} subtitle={subtitle} role={role} name={name} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
}
