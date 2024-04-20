import BaseText from "../base-text";
import Title from "../title";

function AboutAuthor() {
  return (
    <div className="flex w-full max-w-[930px] flex-col space-y-4">
      <Title>Who am I?</Title>
      <BaseText>{`
        I love creating new things by coding. I have always liked "front side"
        of the cyber world. I have been coding since march of 2020. Before, I've
        always been curious about how user interfaces work behind the scenes and
        how I can create them from a blank page in the code editor. I'm
        fascinated in React, before I met this library I have been coding in
        vanilla JS. When I started learning React I felt tons of possibilities.
        I'm a big fan of Next.js with React Server Components. I like taking on
        difficult programming challenges.`}
      </BaseText>
    </div>
  );
}

export default AboutAuthor;
