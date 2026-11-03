import type { CSSProperties, ReactNode } from "react";

type Finish = "titanium" | "black" | "silver" | "gold" | "blue";

interface Props {
  image?: string;
  alt?: string;
  finish?: Finish;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  float?: number;
  lift?: number;
  className?: string;
}

/**
 * Статичная CSS-реализация компонента Device (pro.reactbits.dev/docs/components/device):
 * металлический корпус, динамический остров, наклон по трём осям, покачивание (float)
 * и подъём при наведении (lift). Интерактивный tilt/drag заменён CSS-hover.
 */
export function Device({
  image = "/device-screen.webp",
  alt = "Приложение CIFRA Vault на экране смартфона",
  finish = "titanium",
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  float = 1,
  lift = 1,
  className,
}: Props): ReactNode {
  const floatStyle = { "--f": float } as CSSProperties;
  const tiltStyle = {
    "--rx": `${rotateX}deg`,
    "--ry": `${rotateY}deg`,
    "--rz": `${rotateZ}deg`,
    "--lift": lift,
  } as CSSProperties;

  return (
    <div className={`device-root ${className ?? ""}`} data-finish={finish}>
      <div className="device-float" style={floatStyle}>
        <div className="device-tilt" style={tiltStyle}>
          <div className="device-phone">
            <span className="device-btn device-btn-l1" aria-hidden="true" />
            <span className="device-btn device-btn-l2" aria-hidden="true" />
            <span className="device-btn device-btn-l3" aria-hidden="true" />
            <span className="device-btn device-btn-r" aria-hidden="true" />
            <div className="device-screen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={alt} />
              <span className="device-glare" aria-hidden="true" />
              <span className="device-island" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="device-shadow" aria-hidden="true" />
      </div>
    </div>
  );
}
