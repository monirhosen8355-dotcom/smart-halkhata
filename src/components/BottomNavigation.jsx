import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiPlus,
} from "react-icons/fi";

function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pressed, setPressed] = useState(null);

 const items = [
  {
    key: "home",
    title: "Home",
    icon: <FiHome />,
    path: "/dashboard",
  },
  {
    key: "customers",
    title: "Customers",
    icon: <FiUsers />,
    path: "/customers",
  },

  {
    key: "add",
    title: "",
    icon: <FiPlus />,
    path: "#",
    fab: true,
  },

  {
    key: "reports",
    title: "Reports",
    icon: <FiBarChart2 />,
    path: "/business-overview",
  },

  {
    key: "settings",
    title: "Settings",
    icon: <FiSettings />,
    path: "/settings",
  },
];

  return (
    <>
      <style>{`
      .bn-root{
        position:fixed;
        left:0;
        right:0;
        bottom:0;
        display:flex;
        justify-content:center;
        z-index:9999;
      }

      .bn-wrapper{
        width:100%;
        max-width:520px;
        height:72px;
        background:#fff;
        border-top:1px solid #E5E7EB;
        border-radius:22px 22px 0 0;
        box-shadow:0 -10px 25px rgba(0,0,0,.08);

        display:flex;
        align-items:center;
        justify-content:space-around;

        padding-bottom:env(safe-area-inset-bottom);
      }

      .bn-item{
        flex:1;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        cursor:pointer;
        transition:.18s;
        user-select:none;
      }

      .bn-item.pressed{
        transform:scale(.93);
      }

      .bn-icon{
        font-size:22px;
        color:#9CA3AF;
        transition:.2s;
      }

      .bn-title{
        font-size:11px;
        margin-top:4px;
        color:#9CA3AF;
        font-weight:600;
      }

      .bn-active .bn-icon{
        color:#2563EB;
      }

      .bn-active .bn-title{
        color:#2563EB;
      }
        .bn-fab{
  width:62px;
  height:62px;
  border-radius:50%;
  background:#2563EB;
  color:#fff;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
  margin-top:-35px;
  box-shadow:0 10px 25px rgba(37,99,235,.35);
}

.bn-fab .bn-icon{
  color:#fff !important;
  font-size:30px;
}

.bn-fab-title{
  height:12px;
}

      .bn-dot{
        width:6px;
        height:6px;
        border-radius:50%;
        background:#2563EB;
        margin-bottom:4px;
      }
      `}</style>

      <div className="bn-root">
        <div className="bn-wrapper">

          {items.map((item)=>{

            const active =
  item.path !== "#" &&
  location.pathname === item.path;

            return(
              <div
  key={item.key}
               className={`
  bn-item
  ${item.fab ? "bn-fab" : ""}
  ${active ? "bn-active" : ""}
  ${pressed === item.key ? "pressed" : ""}
`}

                onClick={() => {
  if (item.fab) {
    alert("Coming Soon");
    return;
  }

  navigate(item.path);
}}

                onMouseDown={()=>setPressed(item.key)}
                onMouseUp={()=>setPressed(null)}
                onMouseLeave={()=>setPressed(null)}

                onTouchStart={()=>setPressed(item.key)}
                onTouchEnd={()=>setPressed(null)}
              >

                {active && <div className="bn-dot"></div>}

                <div className="bn-icon">
                  {item.icon}
                </div>

                {!item.fab && (
  <div className="bn-title">
    {item.title}
  </div>
)}

              </div>
            );

          })}

        </div>
      </div>
    </>
  );
}

export default BottomNavigation;