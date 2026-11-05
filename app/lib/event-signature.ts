import {createHmac,timingSafeEqual} from "node:crypto";
export function verifyEventSignature(raw:string,timestamp:string|null,signature:string|null,secret:string,now=Date.now()) {
 if (!timestamp || !signature || !/^\d+$/.test(timestamp) || !/^[a-f0-9]{64}$/.test(signature)) return false;
 if (Math.abs(now-Number(timestamp)*1000)>300000) return false;
 const expected=createHmac("sha256",secret).update(`${timestamp}.${raw}`).digest();
 return timingSafeEqual(expected,Buffer.from(signature,"hex"));
}
