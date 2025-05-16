import * as React from 'react';
import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Html,
   Preview,
   Section,
   Tailwind,
   Text
} from '@react-email/components';
import { SessionMetadata } from '#/types';

interface RecoveryProps {
   username: string;
   domain: string;
   code: string;
   metadata: SessionMetadata;
}

export const RecoveryEmail = ({ username, domain, code, metadata }: RecoveryProps) => {
   const url = `${domain}/recovery/${code}`;
   return (
      <Html>
         <Head />
         <Preview>password reset request</Preview>
         <Tailwind>
            <Body className="bg-white my-auto mx-auto font-sans px-2">
               <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                  <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                     Password reset request on <strong>Trust Data Share</strong>
                  </Heading>
                  <Text className="text-black text-[14px] leading-[24px]">
                     Hello, {username}! We have detected a password reset request from your account. If you haven&apos;t
                     done this, just ignore this email, it&apos;s safe.
                  </Text>
                  <Section className="border border-solid border-[#eaeaea] rounded-lg p-4 bg-gray-50">
                     <Text className="text-black text-[14px] leading-[24px] font-medium mb-2 mt-0">
                        Request details:
                     </Text>
                     <Text className="text-gray-600 text-[12px] leading-[20px] my-1">
                        Device: {metadata.device.client || 'Unknown'} on {metadata.device.os || 'Unknown'}
                     </Text>
                     <Text className="text-gray-600 text-[12px] leading-[20px] my-1">
                        Location: {metadata.location.city ? `${metadata.location.city}, ` : ''}
                        {metadata.location.country || 'Unknown'}
                     </Text>
                     <Text className="text-gray-600 text-[12px] leading-[20px] my-1">IP Address: {metadata.ip}</Text>
                  </Section>

                  <Section className="text-center mt-[32px] mb-[32px]">
                     <Button
                        className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                        href={url}
                     >
                        Yes, reset
                     </Button>
                  </Section>
               </Container>
            </Body>
         </Tailwind>
      </Html>
   );
};
export default RecoveryEmail;
