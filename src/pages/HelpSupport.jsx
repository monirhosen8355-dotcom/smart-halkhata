import BottomNavigation from "../components/BottomNavigation";
import { FaTelegramPlane, FaWhatsapp, FaPhoneAlt } from "react-icons/fa";

function HelpSupport() {
  const open = (url) => window.open(url, "_blank");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "20px 16px 120px",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "6px",
            fontSize: "28px",
            fontWeight: "800",
color: "var(--text)",
          }}
        >
          Help & Support
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "var(--text)",
            marginBottom: "28px",
          }}
        >
          Need help? Contact us anytime.
        </p>

        {/* Telegram */}

        <div
          onClick={() => open("https://t.me/bdtearning66")}
          style={{
            background: "var(--card)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 10px 35px rgba(0,0,0,.45)",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "18px",
              }}
            >
              <div
style={{
display:"flex",
alignItems:"center",
gap:"12px",
}}
>
<FaTelegramPlane
  size={28}
  color="#229ED9"
/>

<span>Telegram</span>
</div>
            </div>

            <div
              style={{
                color: "var(--text)",
                marginTop: "4px",
              }}
            >
              Tap to open Telegram
            </div>
          </div>

          <div
            style={{
              fontSize: "22px",
            }}
          >
            ➜
          </div>
        </div>

        {/* WhatsApp */}

        <div
          onClick={() =>
            open("https://wa.me/8801897889723")
          }
          style={{
            background: "var(--card)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 10px 35px rgba(0,0,0,.45)",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "18px",
              }}
            >
              <div
style={{
display:"flex",
alignItems:"center",
gap:"12px",
}}
>
<FaWhatsapp
  size={28}
  color="#25D366"
/>

<span>WhatsApp</span>
</div>
            </div>

            <div
              style={{
                color: "var(--text-secondary)",
                marginTop: "4px",
              }}
            >
              Tap to chat
            </div>
          </div>

          <div
            style={{
              fontSize: "22px",
            }}
          >
            ➜
          </div>
        </div>
                {/* Phone */}

        <div
          onClick={() => open("tel:01897889723")}
          style={{
            background: "var(--card)",
            borderRadius: "20px",
            padding: "18px",
            marginBottom: "25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            boxShadow: "0 10px 35px rgba(0,0,0,.45)",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "18px",
              }}
            >
              <div
style={{
display:"flex",
alignItems:"center",
gap:"12px",
}}
>
<FaPhoneAlt
  size={24}
  color="#3B82F6"
/>  

<span>Phone Call</span>
</div>
            </div>

            <div
              style={{
                color: "#9CA3AF",
                marginTop: "4px",
              }}
            >
              Tap to call
            </div>
          </div>

          <div
            style={{
              fontSize: "22px",
            }}
          >
            ➜
          </div>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText("01897889723");
            alert("Phone number copied");
          }}
          style={{
            width: "100%",
            height: "52px",
            border: "none",
            borderRadius: "16px",
            background: "#2563EB",
            color: "var(--heading)",
            fontSize: "16px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          📋 Copy Phone Number
        </button>

      </div>

      <BottomNavigation />
    </div>
  );
}

export default HelpSupport;