import { networkInterfaces } from 'os';
import axios from 'axios';

export const getLocalIpv4 = (): string => {
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        const netInterface = nets[name];
        if (netInterface) {
            for (const net of netInterface) {
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
    }
    return '0.0.0.0';
};

export const getPublicIp = async (): Promise<string> => {
    try {
        const response = await axios.get('https://api.ipify.org?format=json');
        return response.data.ip;
    } catch (error) {
        return 'Unable to fetch public IP';
    }
};

export const checkPublicIpAccessibility = async (publicIp: string, PORT : number): Promise<boolean> => {
    try {
        const response = await axios.get(`http://${publicIp}:${PORT}`);
        return response.status === 200;
    } catch (error) {
        return false;
    }
};