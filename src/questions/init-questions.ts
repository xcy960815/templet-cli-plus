import inquirer from 'inquirer';
import { versionQuestion } from '@/questions/version-question';
import { descriptionQuestion } from '@/questions/description-question';
import { templateNameQuestion } from '@/questions/template-question';
import { authorQuestion } from '@/questions/author-question';
import { projectNameQuestion } from '@/questions/project-name-question';
import { deleteFolderQuestion } from '@/questions/delete-folder-question';
import { updateCliVersionQuestion } from '@/questions/update-cli-version-question';
import { downloadSourceQuestion } from '@/questions/download-source-question';
import { downloadTypeQuestion } from '@/questions/download-type-question';
import { replaceUrlQuestion } from '@/questions/replace-url-question';

export const questionsMap = {
  version: versionQuestion,
  description: descriptionQuestion,
  templateName: templateNameQuestion,
  author: authorQuestion,
  projectName: projectNameQuestion,
  deleteFolder: deleteFolderQuestion,
  updateCliVersion: updateCliVersionQuestion,
  replaceUrl: replaceUrlQuestion,
  // downloadSource: downloadSourceQuestion,
  // downloadType: downloadTypeQuestion,
};

export type QuestionsMap = { [key in keyof typeof questionsMap]?: Function };

const initQuestions = async function <K extends keyof QuestionsMap>(
  questions: Array<K>,
): Promise<{ [P in K]: string }> {
  const answers = await inquirer.prompt(
    await Promise.all(
      questions.map((question) => {
        return questionsMap[question]();
      }),
    ),
  );
  return answers as { [P in K]: string };
};

export { initQuestions };
