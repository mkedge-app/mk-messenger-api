import WhatsAppSocket from './WhatsAppSocket';

class WhatsAppSessionManager {
  private sessions: Map<string, WhatsAppSocket> = new Map();

  public async createSession(name: string): Promise<void> {
    if (this.sessions.has(name)) {
      throw new Error(`Session '${name}' already exists`);
    }

    const session = new WhatsAppSocket(name);
    await session.create();

    const QrCodeSubjecSubscription = session.getQrCodeSubject().subscribe(() => {

    });

    const ConnectionOpenedSubjectSubscription = session.getConnectionOpenedSubject().subscribe(() => {
      this.sessions.set(name, session);
    });

    const ConnectionLoggedOutSubjectSubscription = session.getConnectionLoggedOutSubject().subscribe(() => {
      this.sessions.delete(name);
      QrCodeSubjecSubscription.unsubscribe();
      ConnectionOpenedSubjectSubscription.unsubscribe();
      ConnectionClosedSubscription.unsubscribe();
      ConnectionLoggedOutSubjectSubscription.unsubscribe();
    });

    const ConnectionClosedSubscription = session.getConnectionClosedSubject().subscribe(() => {
      this.sessions.delete(name);
      QrCodeSubjecSubscription.unsubscribe();
      ConnectionOpenedSubjectSubscription.unsubscribe();
      ConnectionClosedSubscription.unsubscribe();
      ConnectionLoggedOutSubjectSubscription.unsubscribe();
    });

  }

  public getSession(name: string): WhatsAppSocket | undefined {
    return this.sessions.get(name);
  }

  public getAllSessions(): WhatsAppSocket[] {
    return Array.from(this.sessions.values());
  }

  public async closeSession(name: string): Promise<void> {
    const session = this.sessions.get(name);

    if (session) {
      await session.close();
      this.sessions.delete(name);
    }
  }

  public async closeAllSessions(): Promise<void> {
    for (const session of this.sessions.values()) {
      await session.close();
    }

    this.sessions.clear();
  }
}

export default new WhatsAppSessionManager();
