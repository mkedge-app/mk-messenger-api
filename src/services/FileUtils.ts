import fs from 'fs-extra';
import logger from '../logger';

class FileUtils {
  /**
   * Remove recursivamente uma pasta e seu conteúdo.
   *
   * @param folderPath - O caminho da pasta a ser excluída.
   * @returns Uma Promise que é resolvida quando a pasta é excluída com sucesso.
   * @throws Uma exceção é lançada se ocorrer algum erro ao excluir a pasta.
   */
  public async deleteFolderRecursive(folderPath: string): Promise<void> {
    try {
      await fs.remove(folderPath);
      logger.info(`Pasta excluída com sucesso: ${folderPath}`);
    } catch (error) {
      logger.error(`Erro ao excluir pasta: ${error}`);
      throw error;
    }
  }
}

export default FileUtils;
