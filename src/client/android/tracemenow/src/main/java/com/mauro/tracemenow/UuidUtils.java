package com.mauro.tracemenow;

import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.util.UUID;

public class UuidUtils {

    public UuidUtils() {}

    public static UUID asUuid(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long firstLong = bb.getLong();
        long secondLong = bb.getLong();
        return new UUID(firstLong, secondLong);
    }

    public static byte[] asBytes(String s) {
        s = s.replace("-", "");
        UUID uuid = new UUID(
                new BigInteger(s.substring(0, 16), 16).longValue(),
                new BigInteger(s.substring(16), 16).longValue());
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }
}