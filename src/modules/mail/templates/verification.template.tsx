import {
   Body,
   Button,
   Container,
   Head,
   Heading,
   Hr,
   Html,
   Preview,
   Section,
   Tailwind,
   Text
} from '@react-email/components';
import * as React from "react";

interface VerifyEmailProps {
   username: string;
   domain: string;
   code: string;
}

export const VerifyEmail = ({
   username,
   domain,
  code
}: VerifyEmailProps) => {
   const url = `${domain}/verify/${code}`;
  return (
    <Html>
      <Head />
      <Preview>Email verification</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
              Verify your email to use <strong>Trust Data Share</strong>
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
              Hello, {username}!
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
              Please enter the code below to verify your email or click on the button
            </Text>
            <Section className="text-center mt-[32px] mb-[32px]">
               <Text className="text-black text-[18px] text-center leading-[24px] italic font-semibold">
                  {code}
               </Text>
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={url}
              >
                Verify
              </Button>
            </Section>
            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
            <Text className="text-[#666666] text-[12px] leading-[24px]">
              Thank you for registering on our platform
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};
export default VerifyEmail;
